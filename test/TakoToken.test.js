const { expectRevert } = require('@openzeppelin/test-helpers');
const TakoToken = artifacts.require('TakoToken');

contract('TakoToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.tako = await TakoToken.new({ from: alice });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.tako.name();
        const symbol = await this.tako.symbol();
        const decimals = await this.tako.decimals();
        assert.equal(name.valueOf(), 'Tako');
        assert.equal(symbol.valueOf(), 'TAKO');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.tako.mint(alice, '100', { from: alice });
        await this.tako.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.tako.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.tako.totalSupply();
        const aliceBal = await this.tako.balanceOf(alice);
        const bobBal = await this.tako.balanceOf(bob);
        const carolBal = await this.tako.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.tako.mint(alice, '100', { from: alice });
        await this.tako.mint(bob, '1000', { from: alice });
        await this.tako.transfer(carol, '10', { from: alice });
        await this.tako.transfer(carol, '100', { from: bob });
        const totalSupply = await this.tako.totalSupply();
        const aliceBal = await this.tako.balanceOf(alice);
        const bobBal = await this.tako.balanceOf(bob);
        const carolBal = await this.tako.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.tako.mint(alice, '100', { from: alice });
        await expectRevert(
            this.tako.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.tako.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });
